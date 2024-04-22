@ECHO OFF
SETLOCAL
echo "Compiling Znews..."
cd build
if not exist znews-build (
	mkdir znews-build
)
xcopy /e /i /y .\..\config .\znews-build
cd znews-build
COPY NUL test1
mkdir test2
CALL :Overwrite ".\test1", ".\test2"

:Overwrite
	if exist "%~1" (
		xcopy /e /i /y "%~1" "%~2"	
	)
EXIT /B 0
