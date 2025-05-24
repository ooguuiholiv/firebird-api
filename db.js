import Firebird from "node-firebird";
import { promisify } from "util";
import dotenv from "dotenv";
dotenv.config();

const options = {
  host: process.env.FB_HOST,
  port: Number(process.env.FB_PORT),
  database: process.env.FB_DATABASE,
  user: process.env.FB_USER,
  password: process.env.FB_PASSWORD,
  charset: "UTF8",
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
};

export async function queryFirebird(sql) {
  return new Promise((resolve, reject) => {
    Firebird.attach(options, (err, db) => {
      if (err) return reject(err);

      db.query(sql, (err, result) => {
        if (err) {
          db.detach();
          return reject(err);
        }

        db.detach();
        resolve(result);
      });
    });
  });
}
