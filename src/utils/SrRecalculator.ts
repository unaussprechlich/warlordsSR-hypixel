import {calculateStatsAndSR} from "../SrCalculator";
import {PlayerModel} from "../db/PlayerModel";

export async function recalculateSR(){

    //const res = await PlayerModel.collection.updateMany({}, {$set : {"warlords_sr.ACCURATE_WL" : null}}, {upsert : true});
    //console.log("[DbUpdate] ", res)

    console.log("Recalculating SR ...");
    const projectedPlayers = await PlayerModel.find({}, {uuid : 1});
    console.log("Players found:" + projectedPlayers.length);

    let count = 0;

    async function recalculate(projectedPlayer){
        try{
            let player = await PlayerModel.findOne({uuid : projectedPlayer.uuid})
            if(player != null){
                player = calculateStatsAndSR(player, true)
                await player.save()
                count++;
                console.log("[Reloading|"+ Math.round((count / projectedPlayers.length) * 100) + "%] " + player.name + " -> " + player.warlords_sr.SR + " SR");
            }
        }catch (e){
            console.error(e)
        }
    }

    for (let i = 0; i < projectedPlayers.length; i = i + 20) {
        await Promise.all([
            recalculate(projectedPlayers[i]),
            recalculate(projectedPlayers[i + 1]),
            recalculate(projectedPlayers[i + 2]),
            recalculate(projectedPlayers[i + 3]),
            recalculate(projectedPlayers[i + 4]),
            recalculate(projectedPlayers[i + 5]),
            recalculate(projectedPlayers[i + 6]),
            recalculate(projectedPlayers[i + 7]),
            recalculate(projectedPlayers[i + 8]),
            recalculate(projectedPlayers[i + 9]),
            recalculate(projectedPlayers[i + 10]),
            recalculate(projectedPlayers[i + 11]),
            recalculate(projectedPlayers[i + 12]),
            recalculate(projectedPlayers[i + 13]),
            recalculate(projectedPlayers[i + 14]),
            recalculate(projectedPlayers[i + 15]),
            recalculate(projectedPlayers[i + 16]),
            recalculate(projectedPlayers[i + 17]),
            recalculate(projectedPlayers[i + 18]),
            recalculate(projectedPlayers[i + 19])
        ])
    }
}
