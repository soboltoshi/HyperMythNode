using UnityEngine;

public class AgentView : MonoBehaviour
{
    public string AgentId;

    public void ApplyPosition(Vector3 position)
    {
        transform.position = position;
    }
}
