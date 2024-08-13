// const Joi = require("joi");

// const registerValidation = (data) => {
//   const schema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().min(6).required()
//   });
//   return schema.validate(data);
// };

// const loginValidation = (data) => {
//   const schema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().required()
//   });
//   return schema.validate(data);
// };

// const taskValidation = (data) => {
//   const schema = Joi.object({
//     title: Joi.string().required(),
//     description: Joi.string(),
//     completed: Joi.boolean()
//   });
//   return schema.validate(data);
// };

// module.exports = { registerValidation, loginValidation, taskValidation };


exports.validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  exports.validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };