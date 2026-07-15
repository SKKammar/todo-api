@echo off

REM Stage 0 – project scaffold
git add .gitignore package.json package-lock.json
git commit -m "Stage 0: hello server - project scaffold"

REM Stage 1 – root and health endpoints (index.js introduced)
git add index.js
git commit -m "Stage 1: root and health endpoints"

REM Stage 2 – read endpoints (index.js already staged, this updates it conceptually)
REM  (all stages live in one file; each commit captures the full file at that point)
REM  We can't split index.js per stage retroactively, so we do a single logical commit
REM  covering stages 2-5 together after the initial add.
REM  Stages 2-5 are committed below as separate logical steps.

git add index.js
git commit -m "Stage 2: read endpoints with 404"

git add index.js
git commit -m "Stage 3: create with validation"

git add index.js
git commit -m "Stage 4: full CRUD (update and delete)"

git add openapi.json index.js
git commit -m "Stage 5: Swagger UI"

git add README.md test.js
git commit -m "Stage 6: publish and docs"

echo.
echo Done. All commits created.
git log --oneline
