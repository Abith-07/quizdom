const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", flowbite.content()],

  theme: {
    extend: {
      backgroundImage: {
        'primary-bg': "url(/src/Assets/primarybg.jpg)", 
        'login-bg':"url(/src/Assets/loginbg.jpg)",
        'register-bg':"url(/src/Assets/registerbg.jpg)",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
