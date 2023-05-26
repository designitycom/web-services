import controller from "../controller"
import { Request, Response } from "express";


class UserController extends controller {
  dashboard = async (req: Request, res: Response) => {
    res.send('dashboard')
  }
}

export default new UserController