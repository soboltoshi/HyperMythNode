using UnityEngine;

public class ChessBoardView : MonoBehaviour
{
    public void RequestMove(string from, string to)
    {
        Debug.Log($"Request chess move {from} -> {to}");
    }
}
