-- CreateEnum
CREATE TYPE "color_tone" AS ENUM ('WARM', 'COOL', 'NEUTRAL', 'DARK', 'LIGHT');

-- AlterTable
ALTER TABLE "image" ADD COLUMN     "blurhash" TEXT,
ADD COLUMN     "colorTone" "color_tone" NOT NULL DEFAULT 'NEUTRAL',
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "palette" TEXT[],
ADD COLUMN     "width" INTEGER;
