import React, { useState } from 'react';
import { HfInference } from "@huggingface/inference";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Instantiate HfInference with your API key
const inference = new HfInference("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");

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (event) => {
        setInput(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (input.trim() === '') return;

        setLoading(true);

        try {
            let fullResponse = "";
            const newResponses = [...responses, { user: input, bot: '' }];
            setResponses(newResponses);

            for await (const chunk of inference.chatCompletionStream({
                model: "HuggingFaceH4/zephyr-7b-beta",
                messages: [{ role: "user", content: input }],
                max_tokens: 500,
            })) {
                const chunkText = chunk.choices[0]?.delta?.content || '';
                fullResponse += chunkText;

                // Update the latest bot message dynamically
                newResponses[newResponses.length - 1].bot = fullResponse;
                setResponses([...newResponses]); // Force re-render
            }

            setInput('');
        } catch (error) {
            let errorMessage = 'Error processing your request.';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your API key.';
                } else if (error.response.status === 403) {
                    errorMessage = 'API key does not have the necessary permissions.';
                } else if (error.response.status === 429) {
                    errorMessage = 'Quota exceeded. Please check your plan and billing details.';
                } else {
                    errorMessage = error.response.data.error || errorMessage;
                }
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            setResponses([...responses, { user: input, bot: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    const formatBotResponse = (response) => {
        return response
            .split('\n')
            .map((line, index) => (
                <div key={index} className="whitespace-pre-wrap">
                    {line}
                </div>
            ));
    };

    return (
        <div className="w-full h-full flex flex-col bg-white shadow-lg rounded-lg border border-gray-300">
            <div className="flex-1 overflow-auto p-4">
                {responses.map((msg, index) => (
                    <div key={index} className="mb-4">
                        {/* User message */}
                        <div className="flex items-start mb-2">
                            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg shadow-md max-w-[80%]">
                                <div className="font-bold">You:</div>
                                <div>{msg.user}</div>
                            </div>
                        </div>

                        {/* Bot message */}
                        {msg.bot && (
                            <div className="relative flex items-start mb-2">
                                <div className="bg-green-100 text-green-700 p-3 rounded-lg shadow-md max-w-[80%]">
                                    <div className="font-bold">Bot:</div>
                                    {formatBotResponse(msg.bot)}
                                    <div className="absolute top-1 right-1">
                                        <CopyToClipboard text={msg.bot} onCopy={() => toast.success('Copied to clipboard!')}>
                                            <button className="text-xs text-blue-500 hover:text-blue-700 focus:outline-none">
                                                Copy
                                            </button>
                                        </CopyToClipboard>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex border-t border-gray-300 bg-gray-100">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    className="flex-1 p-2 border-none rounded-l-lg focus:outline-none"
                    placeholder="Ask something..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Chatbot;
