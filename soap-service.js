const userService = {
    UserService: {
        UserPort: {
            getUser: async ({ id }) => {
                console.log('Received SOAP getUser with ID:', id);

                // Simulated DB lookup
                const name = 'John Doe';
                const email = 'john@example.com';

                return {
                    getUserResponse: {
                        name,
                        email
                    }
                };
            },
            createUser: function (args) {
                if (!args.name || !args.email) {
                    throw new Error('Missing required fields: name or email');
                }
                return { status: 'User created successfully', user: { name: args.name, email: args.email } };
            },
        }
    }
};

module.exports = userService;
