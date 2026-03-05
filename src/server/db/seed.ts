import { config } from "dotenv"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { fabrics, variants } from "./schema"
import data from "./data.json"

config({ path: ".env" })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function main() {
  console.log("Seeding started")

  for (const item of data) {
    const [insertedFabric] = await db
      .insert(fabrics)
      .values({ name: item.name })
      .returning({ id: fabrics.id })

    if (insertedFabric) {
      const variantRecords = item.colors.map((color) => ({
        fabricId: insertedFabric.id,
        colorName: color,
      }))

      await db.insert(variants).values(variantRecords)
    }
  }

  console.log("Seeding finished")
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})