const IconsList=require('../IconsList')

const AddDepartmentFields = [
    {
        type: "input",
        name: "department_name",
        label: "Department Name",
        contentType: "string",
        placeholder: "Enter Department Name",
        customStyles: {},
        isMandatory: true,
        iconName: 'FcDepartment',

    },
      
    {
        type: "input",
        name: "manager",
        label: "Manager",
        contentType: "string",
        placeholder: "Enter Manager",
        customStyles: {},
        isMandatory: true,
        iconName:"FaUserTag"
    },
    {
        type: "input",
        name: "email",
        label: "Email ",
        contentType: "email",
        placeholder: "Enter Email Address",
        customStyles: {},
        isMandatory: true,
        iconName: IconsList.email
    },
   
    {
        type: "phone",
        name: "phone",
        label: "Contact No",
        placeholder: "Enter Phone Number",
        customStyles: {},
        isMandatory: true,
        iconName: IconsList.phone
    },
   
        {
        type: "input",
        name: "parent_department",
        label: "Parent Department",
        contentType: "string",
        placeholder: "Enter Department Name",
        customStyles: {},
        isMandatory: true,
        iconName: 'FcDepartment',
    },
    {
        type: "input",
        name: "department_name",
        label: "Short Description",
        contentType: "string",
        placeholder: "Enter Short Description",
        customStyles: {},
        isMandatory: true,
        iconName: 'BiDetail',
    },
     {
        type: "textarea",
        name: "description",
        label: "Description",
        contentType: "string",
        placeholder: "Enter Description",
        customStyles: {},
        isMandatory: true,
        iconName: 'BiDetail',

    },
    

]
module.exports=AddDepartmentFields