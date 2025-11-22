namespace Common.Helper;

public static class ConsoleHelper
{
    public static bool WaitConsoleForUserCommand(string stopCommand)
    {
        var sUserCommand = " ";

        while (!sUserCommand.Equals(stopCommand))
        {
            sUserCommand = Console.ReadLine();

            if (string.IsNullOrEmpty(sUserCommand))
            {
                sUserCommand = string.Empty;
            }

            if (sUserCommand.Trim().Equals(stopCommand))
            {
                return true;
            }
        }

        return false;
    }
}
