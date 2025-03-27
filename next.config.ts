/** @type {import('next').NextConfig} */
 
module.exports = {
  api: {
    responseLimit: "false",
    bodyParser: {
      sizeLimit: "5000mb", // Aumenta o limite de tamanho do corpo
    },
  },
};
