import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()

export async function create (ctx) {
    if (!ctx.headers.authorization) {
        ctx.status = 401

        return
    }

    const [type, token] = ctx.headers.authorization.split(' ')

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET)


        console.log(data);
        if (!ctx.request.body.homeTeamScore && ctx.request.body.awayTeamScore) {
            ctx.status = 400

            return
        }

        const userId = data.sub
        const { gameId } = ctx.request.body
        const homeTeamScore = parseInt(ctx.request.body.homeTeamScore)
        const awayTeamScore = parseInt(ctx.request.body.awayTeamScore)

        try {
            const [hunch] = await prisma.hunch.findMany({
                where: {
                    userId: userId,
                    gameId: gameId
                }
            })

            if (hunch) {
                ctx.body = await prisma.hunch.update({
                    where: {
                        id: hunch.id
                    },
                    data: {
                        homeTeamScore: homeTeamScore,
                        awayTeamScore: awayTeamScore
                    }
                })
            } else {
                ctx.body = await prisma.hunch.create({
                    data: {
                        userId: userId,
                        gameId: gameId,
                        homeTeamScore: homeTeamScore,
                        awayTeamScore: awayTeamScore
                    }
                })
            }

            ctx.status = 200
        } catch (error) {
            ctx.body = error
            ctx.status = 500
        }
    } catch (error) {
        ctx.status = 401

        return
    }
}