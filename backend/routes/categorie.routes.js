const router = require("express").Router();
const controller = require("../controllers/categorie.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

router.post("/", verifyToken, isAdmin, controller.createCategory);
router.get("/", verifyToken, controller.getCategories);
router.put("/:id", verifyToken, isAdmin, controller.updateCategory);
router.delete("/:id", verifyToken, isAdmin, controller.deleteCategory);

module.exports = router;