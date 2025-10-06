
const apiUrl = process.env.HOSTED_API_URL
const IconsList = require('../IconsList')
const IconstList = require('../IconsList')

const AddCompanyFields = [
    {
        type: "input",
        name: "company_name",
        label: "Company Name",
        contentType: "string",
        placeholder: "Enter Company Name",
        customStyles: {},
        isMandatory: true,
        iconName: 'FaBuildingShield',
    },

    {
        type: "input",
        name: "street",
        label: "Street",
        contentType: "string",
        placeholder: "Enter Street Identifier",
        customStyles: {},
        isMandatory: true,
        iconName:"SlLocationPin"
    },
    {
        type: "input",
        name: "city",
        label: "City",
        contentType: "string",
        placeholder: "Enter City",
        customStyles: {},
        isMandatory: true,
        iconName:"SlLocationPin"

    },
    {
        type: "input",
        name: "state",
        label: "State",
        contentType: "string",
        placeholder: "Enter State",
        customStyles: {},
        isMandatory: true,
        iconName:"SlLocationPin"

    },
    {
        type: "input",
        name: "postal_code",
        label: "Postal Code",
        contentType: "string",
        placeholder: "Enter Postal Code",
        customStyles: {},
        isMandatory: true,
        iconName:"SlLocationPin"

    },
    {
        type: "phone",
        name: "phone",
        label: "Phone No",
        placeholder: "Enter Phone Number",
        customStyles: {},
        isMandatory: true,
        iconName: 'FaPhoneAlt'
    },
    {
        type: "input",
        name: "fax_no",
        label: "Fax No",
        contentType: "string",
        placeholder: "Enter Fax No",
        customStyles: {},
        isMandatory: true,
        iconName:'FaFax'
    },
    {
        type: "dropdown",
        name: "currency",
        label: "Currency",
        contentType: "string",
        placeholder: "Select Currency",
        customStyles: {},
        isMandatory: true,
        options: [
            { value: "USD", label: "USD - US Dollar" },
            { value: "EUR", label: "EUR - Euro" },
            { value: "GBP", label: "GBP - British Pound" },
            { value: "INR", label: "INR - Indian Rupee" },
            { value: "JPY", label: "JPY - Japanese Yen" },
            { value: "CNY", label: "CNY - Chinese Yuan" },
            { value: "AUD", label: "AUD - Australian Dollar" },
            { value: "CAD", label: "CAD - Canadian Dollar" },
            { value: "CHF", label: "CHF - Swiss Franc" },
            { value: "SGD", label: "SGD - Singapore Dollar" },
            { value: "AED", label: "AED - UAE Dirham" },
            { value: "ZAR", label: "ZAR - South African Rand" },
        ],
        iconName:'FaMoneyBills'
    }
]

module.exports = AddCompanyFields