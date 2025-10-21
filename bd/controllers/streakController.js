const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
function areConsecutiveDays(date1 , date1){
    const oneDay = 24*60*60*1000;
    const d1 = new Date(date1);//Date is the built in js constructor.
    const d2 = new Date(date2);
    
    
//A Date String (Most Common): A string like "2025-10-21T10:30:00Z" or "October 21, 2025". The Date constructor will parse this string and create a proper date object from it.

//A Timestamp: A number representing the number of milliseconds since January 1, 1970, UTC (the Unix Epoch). The constructor converts this number into the corresponding moment in time.

//An Existing Date Object: If the parent already passed a date object, the constructor creates a copy of it. This prevents changes to d1 from affecting the original object (date1). This is safer for code.
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);
    return d2.getTime() - d1.getTime() === oneDay;

                               }

const getStreaks = async (req , res) => {
    try{
        const streaks = await prisma.streak.findMany({where:{userId: req.user.id},});
        res.status(200).json(streaks);
    }   catch(error){
        console.error("Error fetching streaks : " , error);
        res.status(500).json({message: " Server error while fetching streaks "})
    }

    };

 const updateStreak = async (req , res) =>{ const {taskId} = req.body ;
 const userId  = req.user.id ; 
 if(!taskId){
    return res.status(400).json({message: " Task ID is required "});

 }

 try { 
    const today = new Date();
    const streak  = await prisma.streak.upsert({
        where: {
            userId_taskId : {userId: userId, 
                tsaskId: parseInt(taskId),},

            update: {},
            create:{
                userId: userId,
                taskId: pasreInt(taskId),
                 count:0 , 
            }    

            }
        });

    let newCount =  1;
    if (streak.count  > 0 && areConsecutiveDays(streak.lastUpdated , today ))   {
        newCount = streak.count +  1 ; 
         
    } 

    const updatedStreak = await prisma.streak.update({
        where: {id: streak.id},
        data: {
            count : newCount, 
            lastUpdated: today , 

        }
    });
    res.status(200).json(updatedStreak);}
    catch(error){
        console.error("Error updating streak " , error );
        res.status(500).json({message: " Server error while updating streak. "});
    } 
    };
    const applyForgiveness  = async(req ,res) => { 
        // We'll build this logic later 
        console.log("Reached applyForgiveness endpoint.");
        res.status(200).json({message:"Streak forgveness endpoint reached . "});
    };
    
    module.eexports = { getStreaks ,  updateStreak , applyForgiveness };

  
                             