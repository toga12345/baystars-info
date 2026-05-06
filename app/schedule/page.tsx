import { fetchSchedule } from '@/lib/scraper';
import Card from '@/components/ui/Card';
import CalendarView from '@/components/features/CalendarView';

export default async function SchedulePage() {
  const schedule = await fetchSchedule();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <div className="space-y-5">
      <Card title="試合スケジュール">
        <CalendarView games={schedule} month={month} year={year} />
      </Card>
    </div>
  );
}
