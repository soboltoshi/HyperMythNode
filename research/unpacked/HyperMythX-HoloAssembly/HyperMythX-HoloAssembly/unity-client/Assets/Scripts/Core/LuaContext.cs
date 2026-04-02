using UnityEngine;

public class LuaContext : MonoBehaviour
{
    public void RequestBuildBox(int x, int y, int z, int sx, int sy, int sz, string material)
    {
        Debug.Log($"Preview/Request build box at ({x},{y},{z}) size ({sx},{sy},{sz}) material={material}");
    }

    public void QueueMediaJob(string prompt)
    {
        Debug.Log("Queue media job: " + prompt);
    }
}
