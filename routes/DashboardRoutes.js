const { ROLES } = require("../config/Constants");
const {
  dashboardData,
  paidStudentList,
} = require("../controllers/DashboardController");
const auth = require("../middlewares/Auth");
const roleAuthorization = require("../middlewares/RoleAuthorization");

const router = require("express").Router();

router.get("/", dashboardData);
router.get(
  "/paid-list",
  [auth, roleAuthorization([ROLES.ADMIN])],
  paidStudentList
);

module.exports = router;
