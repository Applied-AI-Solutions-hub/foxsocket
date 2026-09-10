# Design QA - 0.6.0-alpha.1

final result: passed

Compared the approved 03-Workspace-Concept.png and the final Workspace-0.6-Preview.png together. The source includes a Windows frame and presentation canvas; comparison uses its approximately 1428 x 820 content region. Implementation was captured at 1428 x 820 CSS pixels after motion completed, with the same dark conversation route and representative exchange. The preview uses fixture data; it does not prove a live agent connection.

Earlier corrections: restored the 310/main/350 column proportions; increased message and navigation text; replaced interim icons with licensed Fluent icons; enlarged the generated mascot; kept the composer in view at compact sizes. Final capture shows no clipped persistent controls or horizontal overflow.

Required surfaces:
- Typography: Segoe UI family, medium section headings and regular message paragraphs; readable wrapping. The reference is rendered concept art, so exact font rasterization is not reproducible. Slightly smaller supporting text remains a P3 refinement.
- Spacing: three distinct columns, aligned borders, consistent inset controls and pinned composer. The source's optional Retry/search controls are omitted because those actions are not implemented. Tasks remains a functional navigation destination.
- Colors: navy surfaces, cyan primary action, pale text and green connection state preserve the direction. Flat surfaces replace the concept's broad atmospheric glow; acceptable for this test build.
- Images: generated blue mascot is present in brand, agent selection and replies; original Applied AI maker art remains in the installer. Fluent SVG controls stay sharp. Mascot padding is a minor P3 refinement.
- Content: device labels describe this computer; no fixed Lenovo/Gaming PC hardware. The right column explains the actual local connection. Future remote pairing and selected-tools claims were replaced with truthful setup controls. An empty composer correctly disables Send.

Interaction checks: fresh Host path, retained role, bundled offline guide, draft retention, duplicate-submit guard, escaped response HTML, failure recovery, task persistence, generic device data, close preference and reduced motion passed. 1440 x 900, 1000 x 720 and 760 x 600 content viewports retain the composer without horizontal overflow.

Fresh physical PC installation, provider onboarding, first real reply and reboot persistence require the user's test machine. They are release-test checkpoints, not claims established by visual QA.
