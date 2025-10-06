const apiUrl = process.env.HOSTED_API_URL

const IconstList = require('../IconsList')

const AddRoleFields = [
    {
        type: "input",
        name: "role_name",
        label: "Role Name",
        contentType: "string",
        placeholder: "Enter Role Name",
        customStyles: {},
        isMandatory: true,
        iconName: 'BsFillPersonVcardFill',

    },

    {
        type: "input",
        name: "ownership",
        label: "OwnerShip Identifier",
        contentType: "string",
        placeholder: "Enter Ownership Identifier",
        customStyles: {},
        isMandatory: true
    },
    {
        type: "input",
        name: "manager_name",
        label: "Manager",
        contentType: "string",
        placeholder: "Enter Manager Name",
        customStyles: {},
        isMandatory: true
    },
    {
        type: "input",
        name: "email",
        label: "Email ",
        contentType: "email",
        placeholder: "Enter Email Address",
        customStyles: {},
        isMandatory: true,
        iconName: IconstList.email
    },
    {
        type: "dropdown",
        name: "group_type",
        label: "Group Type",
        contentType: "string",
        placeholder: "Select Group",
        customStyles: {},
        isMandatory: true,
        iconName: IconstList.department,
        options: [{
            label: 'Internal', value: 'internal'
        },
        {
            label: 'External', value: 'external'
        },
        ]
    },
    {
        type: "input",
        name: "parent_group",
        label: "Parent Group",
        contentType: "string",
        placeholder: "Enter Parent Group",
        customStyles: {},
        isMandatory: true
    },
    {
        type: "input",
        name: "passport_policy",
        label: "Passport Policy",
        contentType: "string",
        placeholder: "Enter Parent Group",
        customStyles: {},
        isMandatory: true
    },
    {
        type: "input",
        name: "description",
        label: "Description",
        contentType: "string",
        placeholder: "Enter Parent Group",
        customStyles: {},
        isMandatory: true
    },



]

module.exports = AddRoleFields