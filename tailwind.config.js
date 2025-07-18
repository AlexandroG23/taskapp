// tailwind.config.js
module.exports = {
    content: [
      './src/**/*.{astro,html,js,jsx,ts,tsx}', // para Astro y JS
      './node_modules/flowbite/**/*.js'         // 👈 Flowbite
    ],
    theme: {
      extend: {},
    },
    plugins: [
      require('flowbite/plugin')                // 👈 Flowbite plugin
    ],
  };
  