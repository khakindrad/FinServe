namespace Common;

public static class DateTimeUtil
{
    public static DateTime Now => DateTime.Now;
    public static long ElapsedTicks => Now.Ticks;
    public static DateTime Today => DateTime.Today;
    public static DateOnly DateOnly => DateOnly.FromDateTime(Today);
    public static long CurrenTimeStampInMs => (long)TimeSpan.FromTicks(ElapsedTicks).TotalMicroseconds;
}
