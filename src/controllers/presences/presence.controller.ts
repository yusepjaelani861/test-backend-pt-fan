import { NextFunction, Response } from "express";
import { RequestAuth } from "../../interfaces/model";
import { validationResult, body } from "express-validator";
import { sendError } from "../../libraries/globalRest";
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../../middleware/asyncHandler";

const prisma = new PrismaClient();

interface ResponsePresence {
  id_user: number;
  nama_user: string;
  tanggal: string;
  waktu_masuk: string;
  waktu_pulang: string;
  status_masuk: string;
  status_pulang: string;
}

type ValidationPresence = "absence" | "approveAbsence";

export default class PresenceController {
  public static getPresence = asyncHandler(
    async (req: RequestAuth, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          new sendError(
            "Validation error",
            errors.array(),
            "VALIDATION_ERROR",
            422
          )
        );
      }

      let id = parseInt(req.query.id as string);

      if (req.user.npp_supervisor) {
        id = req.user.id;
      }

      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) {
        return next(new sendError("User not found", [], "NOT_FOUND", 404));
      }

      const presences = await prisma.epresence.findMany({
        where: {
          id_users: user.id,
        },
      });

      let ins: ResponsePresence[] = [];
      let outs: ResponsePresence[] = [];
      // by tanggal
      for (let i = 0; i < presences.length; i++) {
        const presence = presences[i];
        const date = new Date(presence.waktu);
        if (presence.type === "IN") {
          ins.push({
            id_user: presence.id_users,
            nama_user: user.nama,
            tanggal:
              date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear(),
            waktu_masuk:
              presence.type === "IN"
                ? date.getHours() +
                  ":" +
                  date.getMinutes() +
                  ":" +
                  date.getSeconds()
                : "",
            waktu_pulang: "",
            status_masuk:
              presence.type === "IN"
                ? presence.is_approve
                  ? "APPROVE"
                  : "REJECT"
                : "",
            status_pulang: "",
          });
        }

        if (presence.type === "OUT") {
          outs.push({
            id_user: presence.id_users,
            nama_user: user.nama,
            tanggal:
              date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear(),
            waktu_masuk: "",
            waktu_pulang:
              presence.type === "OUT"
                ? date.getHours() +
                  ":" +
                  date.getMinutes() +
                  ":" +
                  date.getSeconds()
                : "",
            status_masuk: "",
            status_pulang:
              presence.type === "OUT"
                ? presence.is_approve
                  ? "APPROVE"
                  : "REJECT"
                : "",
          });
        }
      }

      let data: ResponsePresence[] = [];

      for (let i = 0; i < ins.length; i++) {
        const inData = ins[i];
        for (let j = 0; j < outs.length; j++) {
          const outData = outs[j];
          if (
            inData.id_user === outData.id_user &&
            inData.tanggal === outData.tanggal
          ) {
            data.push({
              id_user: inData.id_user,
              nama_user: inData.nama_user,
              tanggal: inData.tanggal,
              waktu_masuk: inData.waktu_masuk,
              waktu_pulang: outData.waktu_pulang,
              status_masuk: inData.status_masuk,
              status_pulang: outData.status_pulang,
            });
          }
        }
      }

      return res.json({
        data: data,
        message: "Success getting data",
      });
    }
  );

  public static absence = asyncHandler(
    async (req: RequestAuth, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          new sendError(
            "Validation error",
            errors.array(),
            "VALIDATION_ERROR",
            422
          )
        );
      }

      const { type, waktu } = req.body;

      let date = new Date(waktu);

      if (
        date.getDate() != new Date().getDate() ||
        date.getMonth() != new Date().getMonth() ||
        date.getFullYear() != new Date().getFullYear()
      ) {
        return next(
          new sendError(
            "Date must be same with date now",
            [],
            "PROCESS_ERROR",
            400
          )
        );
      }

      const cek = await prisma.epresence.count({
        where: {
          id_users: req.user.id,
          type: type,
          waktu: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lte: new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              23,
              59,
              59
            ),
          },
        },
      });

      if (cek > 0) {
        return next(
          new sendError("You have been presence", [], "PROCESS_ERROR", 400)
        );
      }

      const absence = await prisma.epresence.create({
        data: {
          id_users: req.user.id,
          type: type,
          waktu: new Date(waktu),
        },
      });

      return res.json({
        data: [],
        message: "Success absence",
      });
    }
  );

  public static approveAbsence = asyncHandler(
    async (req: RequestAuth, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          new sendError(
            "Validation error",
            errors.array(),
            "VALIDATION_ERROR",
            422
          )
        );
      }

      const { id, status } = req.body;

      const presence = await prisma.epresence.findFirst({
        where: {
          id: parseInt(id as string),
        },
      });

      if (!presence) {
        return next(new sendError("Presence not found", [], "NOT_FOUND", 404));
      }

      const user = await prisma.user.findFirst({
        where: {
          id: presence.id_users,
        },
      });

      if (!user) {
        return next(new sendError("User not found", [], "NOT_FOUND", 404));
      }

      if (user.npp_supervisor !== req.user.npp) {
        return next(
          new sendError(
            "You are not supervisor for this user",
            [],
            "PROCESS_ERROR",
            400
          )
        );
      }

      const update = await prisma.epresence.update({
        where: {
          id: parseInt(id as string),
        },
        data: {
          is_approve: status,
        },
      });

      return res.json({
        data: [],
        message: "Success approve absence",
      });
    }
  );

  public static validator = (method: ValidationPresence) => {
    switch (method) {
      case "absence": {
        return [
          body("type", "Type is required")
            .notEmpty()
            .isIn(["IN", "OUT"])
            .withMessage("Type must be IN or OUT"),
          body("waktu", "Waktu is required").notEmpty(),
        ];
      }

      case "approveAbsence": {
        return [
          body("id", "Id is required")
            .notEmpty()
            .isInt()
            .withMessage("Id must be integer"),
          body("status", "Status is required")
            .notEmpty()
            .isBoolean()
            .withMessage("Status must be boolean"),
        ];
      }
    }
  };
}
