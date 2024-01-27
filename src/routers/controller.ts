import { Request, Response } from "express";

class Controller {
  constructor() { }

  myResponse = async (
    res: Response,
    status: number,
    data: any,
    message: string
  ) => {
    res.status(status).send({ data: data, message: message });
  };
}

export default Controller;
