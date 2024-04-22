@ECHO OFF
SETLOCAL
echo "Compiling Znews..."

CALL :TryDelete ".\build\znews-build"

cd .\src\ui
start /wait /min cmd /c "ng build"
cd .\..\..
CALL :TryMkDir ".\build"
CALL :Overwrite ".\src\backend" ".\build\znews-build"
CALL :Overwrite ".\config" ".\build\znews-build\config"
CALL :Overwrite ".\src\ui\dist\ui" ".\build\znews-build\static"

cd znews-build


:TryMkDir
if not exist "%~1" (
	mkdir "%~1"
)
EXIT /B 0
:TryDelete
	if exist "%~1\*" (
		RMDIR /Q /S "%~1"
	) else (
		if exist "%~1" (
			DEL /Q "%~1"
		)
	)
EXIT /B 0
:Overwrite
	CALL :TryDelete "%~2"
	if exist "%~1\*" (
		xcopy /e /i /y /h "%~1" "%~2"	
	) else (
		if exist "%~1" (
			copy /y "%~1" "%~2"
		)
	)
EXIT /B 0
