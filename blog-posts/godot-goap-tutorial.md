---
title: "Building GOAP AI in Godot: A Practical Tutorial"
category: tutorials
date: 2025-01-05
readTime: 15
xpReward: 200
excerpt: "Step-by-step guide to implementing Goal-Oriented Action Planning in Godot Engine. Includes full code examples and downloadable demo project."
icon: graduation-cap
---

# Building GOAP AI in Godot: A Practical Tutorial

*January 5, 2025 • 15 minute read*

## What You'll Learn

By the end of this tutorial, you'll have a working GOAP system in Godot that can:

- Define goals with priorities and conditions
- Plan action sequences dynamically
- Adapt to changing world states
- Optimize for performance

## Prerequisites

- Godot 4.2 or later
- Basic GDScript knowledge
- Understanding of nodes and scenes

## What is GOAP?

Goal-Oriented Action Planning is an AI architecture where agents:

1. Have **goals** they want to achieve
2. Have **actions** they can perform
3. **Plan** sequences of actions to reach goals

Unlike scripted behavior, GOAP agents adapt dynamically to changing conditions.

## Step 1: Define the World State

```gdscript
# WorldState.gd
extends Node
class_name WorldState

var state: Dictionary = {}

func set_state(key: String, value) -> void:
    state[key] = value

func get_state(key: String):
    return state.get(key, null)

func meets_conditions(conditions: Dictionary) -> bool:
    for key in conditions:
        if state.get(key) != conditions[key]:
            return false
    return true
```

## Step 2: Create Actions

```gdscript
# GOAPAction.gd
extends Resource
class_name GOAPAction

@export var action_name: String
@export var cost: float = 1.0
@export var preconditions: Dictionary = {}
@export var effects: Dictionary = {}

func can_execute(world_state: WorldState) -> bool:
    return world_state.meets_conditions(preconditions)

func execute(agent: Node) -> bool:
    # Override in specific actions
    return false
```

## Step 3: The Planner

```gdscript
# GOAPPlanner.gd
extends Node
class_name GOAPPlanner

func plan(world_state: WorldState, goal: Dictionary, actions: Array) -> Array:
    var open_set = [{"state": world_state.state.duplicate(), "path": [], "cost": 0}]
    var closed_set = []

    while open_set.size() > 0:
        var current = open_set.pop_front()

        # Check if goal is met
        if meets_goal(current.state, goal):
            return current.path

        closed_set.append(current.state)

        # Explore neighbors
        for action in actions:
            if can_apply(action, current.state):
                var new_state = apply_action(action, current.state)
                if not state_in_set(new_state, closed_set):
                    var new_node = {
                        "state": new_state,
                        "path": current.path + [action],
                        "cost": current.cost + action.cost
                    }
                    open_set.append(new_node)

        # Sort by cost (A* heuristic can be added here)
        open_set.sort_custom(func(a, b): return a.cost < b.cost)

    return []  # No plan found

func meets_goal(state: Dictionary, goal: Dictionary) -> bool:
    for key in goal:
        if state.get(key) != goal[key]:
            return false
    return true
```

## Step 4: Example - Hungry NPC

Let's create an NPC that gets hungry and needs to find food:

```gdscript
# HungryNPC.gd
extends CharacterBody2D

var world_state: WorldState
var planner: GOAPPlanner
var actions: Array = []
var current_plan: Array = []

func _ready():
    world_state = WorldState.new()
    planner = GOAPPlanner.new()

    # Set initial state
    world_state.set_state("has_food", false)
    world_state.set_state("hunger", 100)

    # Define actions
    var go_to_kitchen = GOAPAction.new()
    go_to_kitchen.action_name = "GoToKitchen"
    go_to_kitchen.cost = 2.0
    go_to_kitchen.effects = {"at_kitchen": true}

    var get_food = GOAPAction.new()
    get_food.action_name = "GetFood"
    get_food.cost = 1.0
    get_food.preconditions = {"at_kitchen": true}
    get_food.effects = {"has_food": true}

    var eat_food = GOAPAction.new()
    eat_food.action_name = "EatFood"
    eat_food.cost = 1.0
    eat_food.preconditions = {"has_food": true}
    eat_food.effects = {"hunger": 0, "has_food": false}

    actions = [go_to_kitchen, get_food, eat_food]

    # Plan to satisfy hunger
    var goal = {"hunger": 0}
    current_plan = planner.plan(world_state, goal, actions)

    print("Plan: ", current_plan.map(func(a): return a.action_name))
```

## Performance Optimization

For large action sets, consider:

1. **Action Caching:** Cache valid actions per state
2. **Heuristics:** Add A* heuristic for faster planning
3. **Plan Reuse:** Only replan when world state changes significantly
4. **Tick Budgeting:** Spread planning across multiple frames

## Download Demo Project

[Link to GitHub repository with full demo project]

## Conclusion

GOAP provides a flexible, maintainable approach to AI. While more complex than simple FSMs, the emergent behavior and adaptability make it worth the effort for ambitious projects.

**Questions?** Drop them in the comments or reach out via my Contact page!

