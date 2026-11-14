# Third-party components

Clearance's original source is MIT licensed. Dependencies retain their own licenses; the project license does not relicense them.

The application uses Next.js, React and React DOM; development uses TypeScript, tsx and published type packages. The current lockfile also includes AWS SDK packages from provider exploration. Runtime generation uses xAI's API, and retrieval uses HydraDB's API. These hosted services are not bundled or covered by this repository's MIT license.

The lockfile records exact package versions and declared licenses. At the November 14, 2026 review, every package entry had a declared license. Most declarations are MIT or Apache-2.0. Next.js's image dependencies include optional libvips binaries with LGPL-3.0-or-later declarations, and caniuse-lite declares CC-BY-4.0. Preserve the relevant upstream notices when distributing dependencies or compiled bundles. This source repository does not vendor node_modules or ship those binaries.

The standalone generated client apps contain this project's fixed runtime and synthetic workflow configuration. They do not embed React, Next.js or remote assets.

All consulting firms, engagements and policies in the demo corpus are fictional. No private project implementation or client corpus is an input to the demonstration. AI-assisted design and coding tools were used to create this prototype. The model generates bounded workflow configuration; trusted application code validates, checks and compiles it into an executable HTML app.
