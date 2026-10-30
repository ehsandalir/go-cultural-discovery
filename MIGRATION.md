# Lovable source migration (draft)

Source project: https://lovable.dev/projects/e3f74c39-baf4-4075-9ccf-b860f5fc3987

Source snapshot: `e657cb55e435e340b72391686887ce2cc130ab0b`.

112 text source/configuration files were imported. The source `.env` was deliberately excluded. `.env.example` contains variable names only, and `.gitignore` now excludes local environment files.

## Outstanding before merge

Lossless copies of these binary assets are still required:

- `public/favicon.ico`
- `src/assets/go-room.jpg`
- `src/assets/hero.jpg`

The Lovable read-file API decodes binary bytes as UTF-8, so that output was rejected rather than committed. The Lovable workspace has no credits for an export request. Browser export requires a separate Lovable sign-in. No placeholder images were substituted.

This draft is not a runnable, complete migration until these assets are restored. Build/test validation is pending. Database records, hosted authentication configuration, secrets and hosting are not migrated by copying the source. SQL migrations are included; do not apply them to an existing database without reviewing its migration state.

The existing Lovable project was not edited or published. This import is isolated to a branch and does not establish automatic bidirectional Lovable/GitHub sync.
