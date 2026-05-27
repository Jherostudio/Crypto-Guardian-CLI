# Ejecutar esto instalando vhs: https://github.com/charmbracelet/vhs
# Comando: vhs demo.tape

Output demo.gif

Require tsx

Set FontSize 18
Set Width 1200
Set Height 600
Set FontFamily "JetBrains Mono"
Set Theme "Dracula"
Set Padding 20

Type "tsx src/index.ts"
Sleep 500ms
Enter

Sleep 1.5s
# Opción 1: Generar
Type "1"
Enter
Sleep 1s
Type "32"
Enter
Sleep 3s

# Opción 2: Encriptar
Type "2"
Enter
Sleep 1s
Type "mi_secreto_super_confidencial"
Enter
Sleep 1s
Type "mi_frase_maestra_123"
Enter
Sleep 4s

# Salir
Type "4"
Enter
Sleep 2s
