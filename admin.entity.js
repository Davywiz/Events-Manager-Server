const AdminBro = require("admin-bro");
const bcrypt = require("bcryptjs");

const AdminModel = require("../admin.model");

/** @type {AdminBro.ResourceOptions} */
const options = {
    properties: {
        encryptedPassword: {
            isVisible: false,
        },
        password: {
            type: "password",
        },
    },
    actions: {
        new: {
            after: async (response) => {
                if (
                    response.record &&
                    response.record.errors &&
                    response.record.errors.encryptedPassword
                ) {
                    response.record.errors.password =
                        response.record.errors.encryptedPassword;
                }
                return response;
            },
            before: async (request) => {
                if (request.method === "post") {
                    const {
                        password,
                        ...otherParams
                    } = request.payload;

                    if (password) {
                        const encryptedPassword = await bcrypt.hash(password, 12);

                        return {
                            ...request,
                            payload: {
                                ...otherParams,
                                encryptedPassword,
                            },
                        };
                    }
                }
                return request;
            },
            show: {
                isVisible: false,
            },
        },
        edit: {
            after: async (response) => {
                if (
                    response.record &&
                    response.record.errors &&
                    response.record.errors.encryptedPassword
                ) {
                    response.record.errors.password =
                        response.record.errors.encryptedPassword;
                }
                return response;
            },
            before: async (request) => {
                if (request.method === "post") {
                    const {
                        password,
                        ...otherParams
                    } = request.payload;

                    if (password) {
                        const encryptedPassword = await bcrypt.hash(password, 12);

                        return {
                            ...request,
                            payload: {
                                ...otherParams,
                                encryptedPassword,
                            },
                        };
                    }
                }
                return request;
            },
            show: {
                isVisible: false,
            },
        },
    },
};

module.exports = {
    options,
    resource: AdminModel,
};