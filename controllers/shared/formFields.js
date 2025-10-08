
const { defaultCIFormFields, newRelationFields } = require("../../shared/data/CiFormFields")
const AddUserFormFields = require('../../shared/forms/AddUserForm')
const ExternalUserRegistrationformFieldsData = require('../../shared/forms/ExternalUserRegisterForm')
const BecomePartnerFormFields = require('../../shared/forms/BecomePartnerForm')
const { DepartmentsData } = require('../../shared/forms/DesignForms')
const IconsList = require('../../shared/IconsList');

// const DepartmentData = require('../../shared/forms/DesignForms')
// const ConnectionFormsFields = require("../../shared/data/connectionFormsData")


const getCiFormFields = async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!type) {
      return res.status(400).json({ success: false, error: 'Type parameter is required' });
    }
    const initialFields = defaultCIFormFields[type];

    const filteredFields = defaultCIFormFields['commonfields'].map(field => {
      const commonField = initialFields.find(initialField => initialField.name === field.name)
      // console.log('is common: ', commonField)
      !commonField && initialFields.push(field);
    });
    if (!filteredFields || filteredFields.length === 0) {
      return res.status(404).json({ success: false, error: 'No fields found for the specified type' });
    }

    res.status(200).json({ success: true, data: initialFields });
  } catch (err) {
    console.log('error fetching ciFormFields', err)
    res.status(500).send({ success: false, error: err });
  }
}

const getnewRelationFormFields = async (req, res, next) => {
  try {
    const initialFields = newRelationFields;

    if (!initialFields || initialFields.length === 0) {
      return res.status(404).json({ success: false, error: 'No fields found for the specified type' });
    }

    res.status(200).json({ success: true, data: initialFields });
  } catch (err) {
    console.log('error fetching new relation form fields', err)
    res.status(500).send({ success: false, error: err });
  }
}

const getConnectionFormsFields = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: ConnectionFormsFields });
  } catch (err) {
    console.log('error fetching ciFormFields', err)
    res.status(500).send({ success: false, error: err });
  }
}

const getUserFormFields = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: AddUserFormFields });
  } catch (err) {
    console.log('error fetching AddUserFormFields', err)
    res.status(500).send({ success: false, error: err });
  }
}

const getExternalUserRegistrationformFieldsData = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: ExternalUserRegistrationformFieldsData });
  } catch (err) {
    console.log('error fetching AddUserFormFields', err)
    res.status(500).send({ success: false, error: err });
  }
}

const getBecomePartnerFormFields = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: BecomePartnerFormFields });
  } catch (err) {
    console.log('error fetching BecomePartnerFormFields', err)
    res.status(500).send({ success: false, error: err });
  }
}

const getDesignsDepartmentData = async (req, res, next) => {
  try {
    // console.log('department data: ', DepartmentsData)
    res.status(200).json({ success: true, data: DepartmentsData });
  } catch (err) {
    console.log('error fetching DepartmentsData', err)
    res.status(500).send({ success: false, error: err });
  }
}

const getDefaultIconsList = (req, res, next) => {
  try {
    return res.status(200).json({ success: true, data: IconsList });
  } catch (err) {
    console.log('error fetching default icons list', err)
    return res.status(500).send({ success: false, error: err });
  }
}


module.exports = {
  getCiFormFields,
  getnewRelationFormFields,
  getUserFormFields,
  getExternalUserRegistrationformFieldsData,
  getBecomePartnerFormFields,
  getDesignsDepartmentData,
  getDefaultIconsList
}