import odbc from "odbc";
import dotenv from "dotenv";
dotenv.config();

export async function queryFirebird(sql) {
  const connection = await odbc.connect(process.env.ODBC_CONN);
  try {
    const result = await connection.query(sql);
    return result;
  } finally {
    await connection.close();
  }
}
