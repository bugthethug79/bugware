local RunService = game:GetService("RunService")

local kb -- keybind widget, set inside the tab callback

local defaults = {
    on = false,
    negx = 3,
    posx = 3,
    negy = 3,
    posy = 3,
    minamp = 0.5,
    maxamp = 1.5,
    bias = 50,
    dirrate = 15,
    amprate = 8,
    smooth = 0.08,
    ampsmooth = 0.35,
    style = 0,
    twitch = true, 
    tfreq = 1.5,
    tmin = 2.0,
    tmax = 6.0,
    tdmin = 0.08,
    tdmax = 0.18,
    autocenter = false,
    centeramt = 50,
}

UI.AddTab("Mouse Shake", function(tab)
    local act = tab:Section("Activation", "Left")
    act:Toggle("shake_on", "Enabled", defaults.on)
    kb = act:Keybind("shake_kb", 0x58, "hold")
    kb:AddToHotkey("Mouse Shake", "shake_on")

    local range = tab:Section("Shake Range (px)", "Left")
    range:SliderFloat("shake_negx", "-X (Left)", 0, 50, defaults.negx, "%.1f")
    range:SliderFloat("shake_posx", "+X (Right)", 0, 50, defaults.posx, "%.1f")
    range:SliderFloat("shake_negy", "-Y (Up)", 0, 50, defaults.negy, "%.1f")
    range:SliderFloat("shake_posy", "+Y (Down)", 0, 50, defaults.posy, "%.1f")
    range:Tip("uneven bounds = steady drift, use auto-center if you don't want that")

    local intensity = tab:Section("Intensity", "Left")
    intensity:SliderFloat("shake_minamp", "Min Intensity", 0.0, 3.0, defaults.minamp, "%.2f")
    intensity:SliderFloat("shake_maxamp", "Max Intensity", 0.0, 3.0, defaults.maxamp, "%.2f")
    intensity:SliderInt("shake_bias", "Bias (0=min 100=max)", 0, 100, defaults.bias)
    intensity:SliderInt("shake_amprate", "Intensity Update Rate", 1, 60, defaults.amprate)
    intensity:SliderFloat("shake_ampsmoothing", "Intensity Smoothing (s)", 0.05, 1.0, defaults.ampsmooth, "%.2f")

    local motion = tab:Section("Motion Smoothing", "Right")
    motion:SliderInt("shake_dirrate", "Direction Rate (changes/sec)", 1, 60, defaults.dirrate)
    motion:SliderFloat("shake_smoothing", "Position Smoothing (s)", 0.01, 0.5, defaults.smooth, "%.2f")
    motion:Tip("low = twitchy, high = floaty")
    motion:Combo("shake_style", "Axis", { "Both", "Horizontal Only", "Vertical Only" }, defaults.style)

    local twitch = tab:Section("Twitches", "Right")
    twitch:Toggle("shake_twitch_on", "Enable Twitches", defaults.twitch)
    twitch:SliderFloat("shake_twitch_freq", "Frequency (per sec)", 0.0, 10.0, defaults.tfreq, "%.1f")
    twitch:SliderFloat("shake_twitch_min", "Min Strength", 0.0, 30.0, defaults.tmin, "%.1f")
    twitch:SliderFloat("shake_twitch_max", "Max Strength", 0.0, 30.0, defaults.tmax, "%.1f")
    twitch:SliderFloat("shake_twitch_durmin", "Duration Min (s)", 0.02, 0.5, defaults.tdmin, "%.2f")
    twitch:SliderFloat("shake_twitch_durmax", "Duration Max (s)", 0.02, 0.5, defaults.tdmax, "%.2f")

    local center = tab:Section("Auto-Center", "Right")
    center:Toggle("shake_autocenter_on", "Enable Auto-Center", defaults.autocenter)
    center:SliderInt("shake_autocenter_amt", "Strength", 0, 100, defaults.centeramt)
    center:Tip("off by default, only needed if your bounds are uneven and you don't want drift")

    local info = tab:Section("Information", "Right")
    info:Text("Hi guys its me Bugsawe I made ts script")
    info:Text("Script is pretty self explanatory, guide will be posted\nto the website\n\nbugware.cc")
    info:Button("Reset to Defaults", function()
        pcall(UI.SetValue, "shake_on", defaults.on)
        pcall(UI.SetValue, "shake_negx", defaults.negx)
        pcall(UI.SetValue, "shake_posx", defaults.posx)
        pcall(UI.SetValue, "shake_negy", defaults.negy)
        pcall(UI.SetValue, "shake_posy", defaults.posy)
        pcall(UI.SetValue, "shake_minamp", defaults.minamp)
        pcall(UI.SetValue, "shake_maxamp", defaults.maxamp)
        pcall(UI.SetValue, "shake_bias", defaults.bias)
        pcall(UI.SetValue, "shake_dirrate", defaults.dirrate)
        pcall(UI.SetValue, "shake_amprate", defaults.amprate)
        pcall(UI.SetValue, "shake_smoothing", defaults.smooth)
        pcall(UI.SetValue, "shake_ampsmoothing", defaults.ampsmooth)
        pcall(UI.SetValue, "shake_style", defaults.style)
        pcall(UI.SetValue, "shake_twitch_on", defaults.twitch)
        pcall(UI.SetValue, "shake_twitch_freq", defaults.tfreq)
        pcall(UI.SetValue, "shake_twitch_min", defaults.tmin)
        pcall(UI.SetValue, "shake_twitch_max", defaults.tmax)
        pcall(UI.SetValue, "shake_twitch_durmin", defaults.tdmin)
        pcall(UI.SetValue, "shake_twitch_durmax", defaults.tdmax)
        pcall(UI.SetValue, "shake_autocenter_on", defaults.autocenter)
        pcall(UI.SetValue, "shake_autocenter_amt", defaults.centeramt)
    end)
end)

local function frand(a, b)
    if b <= a then return a end
    return a + math.random() * (b - a)
end

-- state for the shake generator
local tx, ty = 0.0, 0.0
local px, py = 0.0, 0.0
local nextDir = 0.0

local ampNow, ampTgt = 1.0, 1.0
local nextAmp = 0.0

local tw_t, tw_dur = 1.0, 0.1
local tw_mag, tw_dx, tw_dy = 0.0, 0.0, 0.0
local tw_cd = 0.0

local avgx, avgy = 0.0, 0.0
local remX, remY = 0.0, 0.0

local function reset()
    tx, ty, px, py, nextDir = 0, 0, 0, 0, 0
    ampNow, ampTgt, nextAmp = 1, 1, 0
    tw_t, tw_mag, tw_cd = 1, 0, 0
    avgx, avgy, remX, remY = 0, 0, 0, 0
end

local function calc(dt)
    local t = os.clock()

    local negx = UI.GetValue("shake_negx") or 3
    local posx = UI.GetValue("shake_posx") or 3
    local negy = UI.GetValue("shake_negy") or 3
    local posy = UI.GetValue("shake_posy") or 3

    local minamp = UI.GetValue("shake_minamp") or 0.5
    local maxamp = UI.GetValue("shake_maxamp") or 1.5
    if minamp > maxamp then minamp, maxamp = maxamp, minamp end
    local bias = UI.GetValue("shake_bias") or 50

    local dirrate = math.max(UI.GetValue("shake_dirrate") or 15, 1)
    local amprate = math.max(UI.GetValue("shake_amprate") or 8, 1)
    local ptau = math.max(UI.GetValue("shake_smoothing") or 0.08, 0.001)
    local atau = math.max(UI.GetValue("shake_ampsmoothing") or 0.35, 0.001)
    local style = UI.GetValue("shake_style") or 0

    if t >= nextDir then
        tx = frand(-negx, posx)
        ty = frand(-negy, posy)
        nextDir = t + (1 / dirrate) * (0.6 + 0.8 * math.random())
    end

    if t >= nextAmp then
        local exp = 2.0 ^ ((50 - bias) / 50)
        ampTgt = minamp + (maxamp - minamp) * (math.random() ^ exp)
        nextAmp = t + (1 / amprate) * (0.6 + 0.8 * math.random())
    end

    px = px + (tx - px) * (1 - math.exp(-dt / ptau))
    py = py + (ty - py) * (1 - math.exp(-dt / ptau))
    ampNow = ampNow + (ampTgt - ampNow) * (1 - math.exp(-dt / atau))

    local ox, oy = px * ampNow, py * ampNow

    if UI.GetValue("shake_twitch_on") then
        local freq = UI.GetValue("shake_twitch_freq") or 1.5
        local tmin = UI.GetValue("shake_twitch_min") or 2.0
        local tmax = UI.GetValue("shake_twitch_max") or 6.0
        local dmin = UI.GetValue("shake_twitch_durmin") or 0.08
        local dmax = UI.GetValue("shake_twitch_durmax") or 0.18

        if tw_cd > 0 then
            tw_cd = tw_cd - dt
        elseif math.random() < dt * freq then
            tw_mag = frand(tmin, tmax)
            local ang = math.random() * math.pi * 2
            tw_dx, tw_dy = math.cos(ang), math.sin(ang)
            tw_dur = frand(dmin, dmax)
            tw_t = 0
            tw_cd = tw_dur + frand(0.1, 0.4)
        end

        if tw_t < tw_dur then
            tw_t = tw_t + dt
            local env = math.sin(math.pi * math.min(tw_t / tw_dur, 1))
            ox = ox + tw_dx * tw_mag * env
            oy = oy + tw_dy * tw_mag * env
        end
    end

    if style == 1 then oy = 0
    elseif style == 2 then ox = 0 end

    if UI.GetValue("shake_autocenter_on") then
        local s = (UI.GetValue("shake_autocenter_amt") or 50) / 100
        avgx = avgx + (ox - avgx) * 0.02
        avgy = avgy + (oy - avgy) * 0.02
        ox = ox - avgx * s
        oy = oy - avgy * s
    end

    return ox, oy
end

local function keyHeld()
    return kb ~= nil and iskeypressed(kb:GetKey())
end

RunService.RenderStepped:Connect(function(dt)
    if UI.GetValue("shake_on") and keyHeld() then
        local sx, sy = calc(dt)
        remX = remX + sx
        remY = remY + sy

        local mx = math.floor(remX + 0.5)
        local my = math.floor(remY + 0.5)
        remX = remX - mx
        remY = remY - my

        if mx ~= 0 or my ~= 0 then
            mousemoverel(mx, my)
        end
    else
        reset()
    end
end)