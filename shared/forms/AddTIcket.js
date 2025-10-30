const apiUrl = process.env.HOSTED_API_URL;
const IconsList = require('../IconsList');

const AddNewTicketFields = [
  // 🧩 Non-textarea fields (kept in order)
  { type: "input", name: "id", label: "Ticket ID", contentType: "string", placeholder: "Enter Ticket ID", isMandatory: false, iconName: "IoNewspaperOutline" },
  { type: "input", name: "name", label: "Ticket Name", contentType: "string", placeholder: "Enter Ticket Name", isMandatory: true,},
  { type: "dropdown", name: "channel", label: "Channel", contentType: "string", placeholder: "Select Channel", isMandatory: false, options: [{label:'userType',value:'user_type'}], iconName: "GrChannel" },
  { type: "input", name: "org_id", label: "Organization ID", contentType: "string", placeholder: "Enter Organization ID", isMandatory: false, iconName: "FaBuilding" },
  { type: "input", name: "flows_stage", label: "Flows Stage", contentType: "string", placeholder: "Enter Flows Stage", isMandatory: false,
    //  iconName: "FaProjectDiagram" 
    },

  { type: "dropdown", name: "state", label: "State", contentType: "string", placeholder: "Select State", isMandatory: false, options: [], iconName: "SlLocationPin" },
  { type: "toggle", name: "confirm_closing", label: "Confirm Closing", contentType: "boolean", isMandatory: false, iconName: "FaCheckCircle" },
  { type: "input", name: "on_behalf_of", label: "On Behalf Of", contentType: "string", placeholder: "Enter On Behalf Of", isMandatory: false, iconName: "FaUser" },
  { type: "dropdown", name: "category", label: "Category", contentType: "string", placeholder: "Select Category", isMandatory: true, options: [], 
    // iconName: "FaList"
   },
  { type: "input", name: "updated_on", label: "Updated On", contentType: "date", placeholder: "Enter Updated Date", isMandatory: false,
    //  iconName: "FaCalendarAlt"
     },
  { type: "dropdown", name: "sub_category", label: "Sub Category", contentType: "string", placeholder: "Select Sub Category", isMandatory: false, options: [], 
    // iconName: "FaListUl"
   },
  { type: "dropdown", name: "service", label: "Service", contentType: "string", placeholder: "Select Service", isMandatory: false, options: [], 
    // iconName: "FaConciergeBell" 
    
  },
  { type: "input", name: "assigned_members", label: "Assigned Members", contentType: "string", placeholder: "Select Assigned Members", isMandatory: false, options: [], 
    // iconName: "FaUsers" 
  },
  { type: "input", name: "closed_on", label: "Closed On", contentType: "date", placeholder: "Enter Closed Date", isMandatory: false, 
    // iconName: "FaCalendarTimes" 
  },
  {
    type: "dropdown", name: "status", label: "Status", contentType: "string",
    placeholder: "Select Status", isMandatory: true,
    options: [
      { value: "Open", label: "Open" },
      { value: "In Progress", label: "In Progress" },
      { value: "Resolved", label: "Resolved" },
      { value: "Closed", label: "Closed" }
    ],
    // iconName: "FaInfoCircle"
  },
  { type: "dropdown", name: "approval_state", label: "Approval State", contentType: "boolean", isMandatory: false, 
    // iconName: "FaCheckDouble" 
  },
  { type: "toggle", name: "active", label: "Active", contentType: "boolean", isMandatory: false,
    //  iconName: "FaToggleOn" 
    },
  {
    type: "dropdown", name: "priority", label: "Priority", contentType: "string",
    placeholder: "Select Priority", isMandatory: true,
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
      { value: "Critical", label: "Critical" }
    ],
    // iconName: "FaExclamationTriangle"
  },
  { type: "input", name: "requested_email", label: "Requested Email", contentType: "email", placeholder: "Enter Requested Email", isMandatory: true, 
    iconName: "FaEnvelope"
   },
  { type: "dropdown", name: "department", label: "Department", contentType: "string", placeholder: "Select Department", isMandatory: true, options: [], iconName: "FaBuilding" },
  { type: "input", name: "approved_by", label: "Approved By", contentType: "string", placeholder: "Enter Approved By", isMandatory: false, iconName: "FaUserCheck" },
  { type: "input", name: "requested_by", label: "Requested By", contentType: "string", placeholder: "Enter Requested By", isMandatory: false, iconName: "FaUserTag" },
  { type: "dropdown", name: "task_type", label: "Task Type", contentType: "string", placeholder: "Select Task Type", isMandatory: false, options: [], iconName: "FaTasks" },
  { type: "file", name: "attachments", label: "Attachments", contentType: "file", placeholder: "Upload Files", isMandatory: false, iconName: "FaPaperclip" },
  { type: "input", name: "price_per_unit", label: "Price Per Unit", contentType: "number", placeholder: "Enter Price Per Unit", isMandatory: false, iconName: "FaDollarSign" },
  { type: "input", name: "quantity", label: "Quantity", contentType: "number", placeholder: "Enter Quantity", isMandatory: false },
  { type: "dropdown", name: "assigned_group", label: "Assigned Group", contentType: "string", placeholder: "Select Assigned Group", isMandatory: false, options: [], iconName: "FaUsersCog" },
  // { type: "input", name: "created_by", label: "Created By", contentType: "string", placeholder: "Enter Creator Name", isMandatory: false, iconName: "FaUserPlus" },
  // { type: "input", name: "solution_due_date", label: "Solution Due Date", contentType: "date", placeholder: "Select Solution Due Date", isMandatory: false, iconName: "FaCalendarCheck" },
  { type: "input", name: "subject", label: "Subject", contentType: "string", placeholder: "Enter Subject", isMandatory: true, iconName: "FaBook" },
  { type: "input", name: "created_on", label: "Created On", contentType: "date", placeholder: "Enter Created Date", isMandatory: false,},
//   { type: "tags", name: "tags", label: "Tags", contentType: "string", placeholder: "Enter Tags", isMandatory: false, iconName: "FaTags" },
  { type: "input", name: "group_id", label: "Group ID", contentType: "string", placeholder: "Enter Group ID", isMandatory: false, iconName: "FaUsersCog" },

  // 📝 All textarea fields moved to bottom
//   { type: "textarea", name: "action_plan", label: "Action Plan", contentType: "string", placeholder: "Enter Action Plan", isMandatory: false, iconName: "FaTasks" },
//   { type: "textarea", name: "internal_notes", label: "Internal Notes", contentType: "string", placeholder: "Enter Internal Notes", isMandatory: false, iconName: "FaUserSecret" },
//   { type: "textarea", name: "external_notes", label: "External Notes", contentType: "string", placeholder: "Enter External Notes", isMandatory: false, iconName: "FaStickyNote" },
//   { type: "textarea", name: "short_description", label: "Short Description", contentType: "string", placeholder: "Enter Short Description", isMandatory: true, iconName: "FaStickyNote" },
//   { type: "textarea", name: "description", label: "Description", contentType: "string", placeholder: "Enter Description", isMandatory: true, iconName: "FaFileAlt" },
//   { type: "textarea", name: "private_comments", label: "Private Comments", contentType: "string", placeholder: "Enter Private Comments", isMandatory: false, iconName: "FaLock" },
//   { type: "textarea", name: "public_comments", label: "Public Comments", contentType: "string", placeholder: "Enter Public Comments", isMandatory: false, iconName: "FaCommentDots" },
//   { type: "textarea", name: "history", label: "History", contentType: "string", placeholder: "Enter History Details", isMandatory: false, iconName: "FaHistory" },
];

module.exports = AddNewTicketFields;
