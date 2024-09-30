import NotificationCron from './cron/NotificationCron';
import ProgramCron from './cron/NewProgramCron';
import DatabaseCleanerCron from './cron/DatabaseCleanerCron';

const notificationCron = new NotificationCron();
const programCron = new ProgramCron();
const databaseCleaner = new DatabaseCleanerCron();

process.nextTick(function () {
    console.log(`CRON JOBS STARTED...`);
    notificationCron.start();
    programCron.start();
    databaseCleaner.start()
});
