using UnityEngine;

public class CreatorShellRig : MonoBehaviour
{
    public enum ShellMode { Builder, Director, Coder }
    public ShellMode CurrentMode = ShellMode.Builder;

    public void SetMode(ShellMode mode)
    {
        CurrentMode = mode;
        Debug.Log("Shell mode: " + mode);
    }
}
