"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Your YOLO training data with train/box_loss, train/cls_loss, recall, val/box_loss
const trainingData = [
    {
        epoch: 30,
        train_box_loss: 1.01216,
        train_cls_loss: 0.85592,
        recall: 0.70615,
        val_box_loss: 1.01188,
    },
    {
        epoch: 60,
        train_box_loss: 0.83186,
        train_cls_loss: 0.66247,
        recall: 0.72634,
        val_box_loss: 0.92745,
    },
    {
        epoch: 90,
        train_box_loss: 0.74505,
        train_cls_loss: 0.58073,
        recall: 0.73448,
        val_box_loss: 0.91146,
    },
    {
        epoch: 120,
        train_box_loss: 0.68545,
        train_cls_loss: 0.51843,
        recall: 0.73181,
        val_box_loss: 0.91676,
    },
    {
        epoch: 150,
        train_box_loss: 0.63401,
        train_cls_loss: 0.47890,
        recall: 0.74140,
        val_box_loss: 0.88768,
    },
    {
        epoch: 180,
        train_box_loss: 0.60953,
        train_cls_loss: 0.46030,
        recall: 0.74994,
        val_box_loss: 0.87585,
    },
    {
        epoch: 210,
        train_box_loss: 0.57480,
        train_cls_loss: 0.42705,
        recall: 0.72673,
        val_box_loss: 0.89930,
    },
    {
        epoch: 240,
        train_box_loss: 0.55577,
        train_cls_loss: 0.41182,
        recall: 0.73158,
        val_box_loss: 0.88406,
    },
    {
        epoch: 270,
        train_box_loss: 0.53823,
        train_cls_loss: 0.39861,
        recall: 0.74744,
        val_box_loss: 0.88322,
    },
    {
        epoch: 300,
        train_box_loss: 0.51697,
        train_cls_loss: 0.38239,
        recall: 0.74722,
        val_box_loss: 0.89142,
    },
    {
        epoch: 330,
        train_box_loss: 0.50022,
        train_cls_loss: 0.36813,
        recall: 0.74080,
        val_box_loss: 0.87236,
    },
    {
        epoch: 350,
        train_box_loss: 0.43909,
        train_cls_loss: 0.29551,
        recall: 0.73859,
        val_box_loss: 0.91513,
    },
];



// Custom tooltip with dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Epoch {label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toFixed(4)}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export function TrainingMetrics() {
    // Find best epoch (lowest training box loss)
    const bestEpoch = trainingData.reduce((best, current) =>
        current.train_box_loss < best.train_box_loss ? current : best
    )

    // Find highest recall
    const highestRecall = trainingData.reduce((best, current) =>
        current.recall > best.recall ? current : best
    )

    return (
        <Card className="bg-card border-border col-span-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">YOLOv8 Training Performance</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            PPE Detection Model - 350 Epochs Training
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Lowest Loss Achieved</div>
                        <div className="text-2xl font-bold text-success">
                            {bestEpoch.train_box_loss.toFixed(3)}
                        </div>
                        <div className="text-xs text-muted-foreground">Train Box Loss at Epoch {bestEpoch.epoch}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={trainingData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis
                            dataKey="epoch"
                            stroke="#555"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 10 }}
                        />
                        <YAxis
                            stroke="#555"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 1.2]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }}
                            verticalAlign="top"
                            align="right"
                        />

                        {/* Train Box Loss */}
                        <Line
                            type="monotone"
                            dataKey="train_box_loss"
                            stroke="#FF3B30"
                            strokeWidth={2.5}
                            name="Train Box Loss"
                            dot={{ fill: '#FF3B30', r: 3 }}
                            activeDot={{ r: 5 }}
                        />

                        {/* Train Class Loss */}
                        <Line
                            type="monotone"
                            dataKey="train_cls_loss"
                            stroke="#FF9F0A"
                            strokeWidth={2.5}
                            name="Train Cls Loss"
                            dot={{ fill: '#FF9F0A', r: 3 }}
                            activeDot={{ r: 5 }}
                        />

                        {/* Validation Box Loss */}
                        <Line
                            type="monotone"
                            dataKey="val_box_loss"
                            stroke="#BF5AF2"
                            strokeWidth={2.5}
                            name="Val Box Loss"
                            dot={{ fill: '#BF5AF2', r: 3 }}
                            activeDot={{ r: 5 }}
                        />

                        {/* Recall */}
                        <Line
                            type="monotone"
                            dataKey="recall"
                            stroke="#34C759"
                            strokeWidth={3}
                            name="Recall"
                            dot={{ fill: '#34C759', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* Training Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            {bestEpoch.train_box_loss.toFixed(3)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Lowest Train Box Loss</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-warning">
                            {bestEpoch.train_cls_loss.toFixed(3)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Train Cls Loss @ E350</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-success">
                            {(highestRecall.recall * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Peak Recall</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                            350
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Total Epochs</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
