import { Router } from "express";
import auth from "../middleware/auth.js";
import { admin } from '../middleware/Admin.js'
import cachePublic from '../middleware/cachePublic.js'
import { AddSubCategoryController, deleteSubCategoryController, getSubCategoryController, updateSubCategoryController } from "../controllers/subCategory.controller.js";

const subCategoryRouter = Router()

subCategoryRouter.post('/create',auth,admin,AddSubCategoryController)
subCategoryRouter.post('/get',getSubCategoryController)
subCategoryRouter.get('/get',cachePublic,getSubCategoryController)
subCategoryRouter.put('/update',auth,admin,updateSubCategoryController)
subCategoryRouter.delete('/delete',auth,admin,deleteSubCategoryController)

export default subCategoryRouter