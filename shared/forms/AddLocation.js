const IconsList = require('../IconsList')


const AddLocationFields = [
    {
        type: "input",
        name: "location_name",
        label: "Location Name",
        contentType: "string",
        placeholder: "Enter Location Name",
        customStyles: {},
        isMandatory: true,
        iconName: 'SlLocationPin',

    },
    {
        type: "input",
        name: "street",
        label: "Street",
        contentType: "string",
        placeholder: "Enter Street",
        isMandatory: true,
        iconName: '',

    },
    {
        type: "input",
        name: "city",
        label: "City",
        contentType: "",
        placeholder: "Enter City",
        isMandatory: true,
        iconName: '',

    },
    {
        type: "input",
        name: "state",
        label: "State",
        contentType: "",
        placeholder: "Enter State",
        isMandatory: true,
        iconName: '',

    },
    {
        type: "input",
        name: "postal_code",
        label: "Postal Code",
        contentType: "",
        placeholder: "Enter Postal Code",
        isMandatory: true,
        iconName: '',
    },
    {
        type: "phone",
        name: "phone_no",
        label: "Phone No",
        placeholder: "Enter Phone Number",
        customStyles: {},
        isMandatory: true,
        iconName: 'FaPhoneAlt'
    },
    {
        type: "phone",
        name: "contact",
        label: "Contact No",
        placeholder: "Enter Phone Number",
        customStyles: {},
        isMandatory: true,
        iconName:'FaPhoneAlt'
    },
    {
        type: "input",
        name: "fax_no",
        label: "Fax No",
        contentType: "",
        placeholder: "Enter Fax No",
        isMandatory: true,
        iconName: 'FaFax',
    },
    {
        type: "input",
        name: "parent_location",
        label: "Parent Location",
        contentType: "",
        placeholder: "Enter Parent Location",
        isMandatory: true,
        iconName: 'SlLocationPin',

    },

]
module.exports = AddLocationFields