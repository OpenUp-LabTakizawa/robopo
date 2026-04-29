import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register({
  // Components using <Image> from next/image build absolute URLs from
  // window.location, so we need a real http(s) origin in jsdom-land.
  url: "http://localhost",
})
