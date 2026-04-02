import type { Request, Response } from "express";

export function add(req: Request, res: Response) {}
export function remove(req: Request, res: Response) {}
export function update(req: Request, res: Response) {}
export function list(req: Request, res: Response) {}

export function logout(req: Request, res: Response) {} // force logouts of a user or many users at once! by revoking their refresh tokens from redis
