
const apiUrl = process.env.HOSTED_API_URL
const IconsList = require('../IconsList')
const IconstList = require('../IconsList')

const AddGroupsFields = [
    {
        type: "input",
        name: "group_name",
        label: "Name",
        contentType: "string",
        placeholder: "Enter Group Name",
        customStyles: {},
        isMandatory: true,
        iconName: 'PiUsersFourFill',

    },

    {
        type: "input",
        name: "ownership",
        label: "OwnerShip Identifier",
        contentType: "string",
        placeholder: "Enter Ownership Identifier",
        customStyles: {},
        isMandatory: true,
        iconName:'RiKey2Line'
    },
    {
        type: "input",
        name: "manager_name",
        label: "Manager",
        contentType: "string",
        placeholder: "Enter Manager Name",
        customStyles: {},
        isMandatory: true,
         iconName:'RiAdminLine'
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
        isMandatory: true,
        iconName:'FaSitemap'
    },
    {
        type: "input",
        name: "passport_policy",
        label: "Passport Policy",
        contentType: "string",
        placeholder: "Enter Parent Group",
        customStyles: {},
        isMandatory: true,
        iconName:'FaPassport'
    },
    {
        type: "input",
        name: "description",
        label: "Description",
        contentType: "string",
        placeholder: "Enter Parent Group",
        customStyles: {},
        isMandatory: true,
          iconName:'BiDetail'
    },



]

module.exports = AddGroupsFields