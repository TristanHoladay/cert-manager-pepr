import { Capability, a, K8s } from "pepr";

export const CertManagerIstio = new Capability({
  name: "cert-manager-istio",
  description:
    "Take certicicate secrets made by cert-manager and apply to DUBBD deployed Istio gateways.",
  namespaces: ["istio-system, cert-manager"],
});

const { When } = CertManagerIstio;

class Gateway extends a.GenericKind {}

When(a.Secret)
  .IsCreated()
  .WithLabel("app.kubernetes.io/istio-gateway-secret", "admin")
  .Mutate(async secret => {
    await K8s(a.GenericKind, {
      kindOverride: {
        kind: "gateways",
        group: "networking.istio.io",
        version: "v1beta1",
      },
      name: "admin",
      namespace: "istio-system",
    }).Patch([
      {
        op: "replace",
        path: "/spec/servers/1/tls/credentialName",
        value: secret.Raw.metadata.name,
      },
    ]);

    // await ck8s.patchNamespacedCustomObject(
    //   "networking.istio.io",
    //   "v1beta1",
    //   "istio-system",
    //   "gateways",
    //   "admin",
    //   [
    //     {
    //       op: "replace",
    //       path: "/spec/servers/1/tls/credentialName",
    //       value: secret.Raw.metadata.name,
    //     },
    //   ],
    //   undefined,
    //   undefined,
    //   undefined,
    //   { headers: { "content-type": "application/json-patch+json" } },
    // );
  });
