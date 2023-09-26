import { PeprModule } from "pepr";
// cfg loads your pepr configuration from package.json
import cfg from "./package.json";
import { CertManagerIstio } from "./capabilities/cert-manager-istio";

new PeprModule(cfg, [CertManagerIstio]);
