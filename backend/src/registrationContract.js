const registrationContract = {
  endpoint: '/api/users/register/',
  successStatus: 201,
  postRegistrationAction: 'account-created',
  fields: [
    {
      name: 'firstName',
      label: 'First name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    {
      name: 'lastName',
      label: 'Last name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      required: true,
      maxLength: 320,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      minLength: 8,
      maxLength: 128,
    },
    {
      name: 'consentAccepted',
      label: 'I agree to the platform terms',
      type: 'checkbox',
      required: true,
    },
  ],
};

module.exports = {
  registrationContract,
};
