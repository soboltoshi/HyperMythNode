using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class RustStateClient : MonoBehaviour
{
    [SerializeField] private string snapshotUrl = "http://127.0.0.1:8787/snapshot";

    public void RefreshSnapshot()
    {
        StartCoroutine(FetchSnapshot());
    }

    private IEnumerator FetchSnapshot()
    {
        using UnityWebRequest request = UnityWebRequest.Get(snapshotUrl);
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning("Kernel snapshot fetch failed: " + request.error);
            yield break;
        }

        Debug.Log("Kernel snapshot: " + request.downloadHandler.text);
    }
}
