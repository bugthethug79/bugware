local ShakeKeybindHandle

UI.AddTab("Mouse Shake", function(tab)
    local activation = tab:Section("Mouse Shake", "Left")

    activation:Toggle("shake_on", "Enabled")
    ShakeKeybindHandle = activation:Keybind("shake_kb", 0x00, "hold")
    ShakeKeybindHandle:AddToHotkey("Mouse Shake", "shake_on")

    activation:SliderInt("shake_left", "-X (Left)", 0, 50, 3)
    activation:SliderInt("shake_right", "+X (Right)", 0, 50, 3)
    activation:SliderInt("shake_up", "-Y (Up)", 0, 50, 3)
    activation:SliderInt("shake_down", "+Y (Down)", 0, 50, 3)

    activation:SliderInt("shake_cycles", "Cycles", 1, 60, 15)
    activation:SliderInt("shake_centering", "Centering %", 0, 100, 45)

    local info = tab:Section("Information", "Right")

    info:Text("Hi guys its me Bugsawe I made ts script")
	info:Text("Script is pretty self explanatory, guide will be posted\nto the website\n\nbugware.cc")
end)

local function roundInt(n)
    if n >= 0 then
        return math.floor(n + 0.5)
    else
        return -math.floor(-n + 0.5)
    end
end

local function randomFloat(min, max)
    if max <= min then return min end
    return min + (math.random() * (max - min))
end

local driftX, driftY = 0, 0

local function shakeStep()
    local left = UI.GetValue("shake_left")
    local right = UI.GetValue("shake_right")
    local up = UI.GetValue("shake_up")
    local down = UI.GetValue("shake_down")
    local centering = UI.GetValue("shake_centering") / 100 -- 0..1
    local rawX = randomFloat(-left, right)
    local rawY = randomFloat(-up, down)
    local dx = rawX - (driftX * centering)
    local dy = rawY - (driftY * centering)

    driftX = driftX + dx
    driftY = driftY + dy

    local ix, iy = roundInt(dx), roundInt(dy)
    if ix ~= 0 or iy ~= 0 then
        mousemoverel(ix, iy)
    end
end

task.spawn(function()
    while true do
        local toggledOn = UI.GetValue("shake_on")
        local keyHeld = ShakeKeybindHandle ~= nil
            and iskeypressed(ShakeKeybindHandle:GetKey())

        if toggledOn and keyHeld then
            shakeStep()

            local cps = math.max(UI.GetValue("shake_cycles") or 15, 1)
            task.wait(1 / cps)
        else
            driftX, driftY = 0, 0
            task.wait()
        end
    end
end)