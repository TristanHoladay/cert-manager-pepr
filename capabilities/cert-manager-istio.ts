import { Capability, a, K8s, Log } from "pepr";

export const CertManagerIstio = new Capability({
  name: "cert-manager-istio",
  description:
    "Take certicicate secrets made by cert-manager and apply to DUBBD deployed Istio gateways.",
  namespaces: ["istio-system, cert-manager"],
});

const { When } = CertManagerIstio;

async function patchGateway(gateway: string, secretName: string) {
  await K8s(a.GenericKind, {
    kindOverride: {
      kind: "gateways",
      group: "networking.istio.io",
      version: "v1beta1",
    },
    name: gateway,
    namespace: "istio-system",
  })
    .Patch([
      {
        op: "replace",
        path: "/spec/servers/1/tls/credentialName",
        value: secretName,
      },
    ])
    .catch(e => Log.error(e));
}

When(a.Secret)
  .IsCreated()
  .InNamespace("istio-system")
  .WithLabel("app.kubernetes.io/istio-gateway-secret", "admin")
  .Mutate(async secret => {
    patchGateway("admin", secret.Raw.metadata.name);
  });

When(a.Secret)
  .IsCreated()
  .InNamespace("istio-system")
  .WithLabel("app.kubernetes.io/istio-gateway-secret", "tenant")
  .Mutate(async secret => {
    await patchGateway("tenant", secret.Raw.metadata.name);
  });
