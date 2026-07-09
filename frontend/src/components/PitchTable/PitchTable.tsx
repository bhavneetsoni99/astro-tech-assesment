import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import ApiService from "../../services/api";
import { PitchesResponse, PitchFilterOptions, TableRow } from "../../types";
import { TableComponent } from "../TableComponent";
import { useSort } from "../../utils";

interface PitchTableProps {
  filters?: PitchFilterOptions;
}

const PITCH_COLUMNS = [['Pitcher', 'colFlex'], ['P.Team', 'colFlex'], 
['Type', 'colFlex'], ['Spd', 'colSmall'], ['Batter', 'colFlex'],
 ['B.Team', 'colFlex'], ['Res', 'colFlex'], ['Date', 'colFlex']]
const DEFAULT_LIMIT = 50;
export const PitchTable: React.FC<PitchTableProps> = ({
  filters = {},
}) => {
  const navigate = useNavigate()
  const [pitchesResponse, setPitchesResponse] = useState<PitchesResponse>({
    pitches: [],
    total_count: 0,
    next_cursor: null,
    limit: DEFAULT_LIMIT
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { release_speed, pitcher, batter, pitch_name, pitching_team, batting_team } = filters;
  const { pitches, total_count, next_cursor } = pitchesResponse;

  const fetchPitches = useCallback((cursorValue?: number | null) => {
    setIsLoading(true);
    setError("");
    const queries = {
      pitch_name,
      pitching_team, 
      batting_team,
      ...(cursorValue && { next_cursor: cursorValue }),
      ...(release_speed && { release_speed }),
      ...(pitcher && { pitcher }),
      ...(batter && { batter })
    }
    ApiService.getPitches(queries)
      .then((res) => setPitchesResponse((prev) => {
        if (!cursorValue) { //will be passed only when we call load more manually
          return res;
        }

        return {
          ...res,
          total_count: prev.total_count, //total count only returned on initial load
          pitches: [...prev.pitches, ...res.pitches],
        };
      }))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [release_speed, pitcher, batter, pitch_name, pitching_team, batting_team]);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPitches();
  }, [fetchPitches]);

  const formatGameDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const formatDescription = (desc: string) =>
  desc.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const rows = useMemo(() => pitches.map((pitch) => ({
    id: pitch.rowid,
    cells: [
      `${pitch.pitcher_details.first_name?.charAt(0)}. ${pitch.pitcher_details.last_name}`,
      pitch.pitcher_details.team,
      pitch.pitch_name,
      pitch.release_speed,
      `${pitch.batter_details.first_name?.charAt(0)}. ${pitch.batter_details.last_name}`,
      pitch.batter_details.team,
      formatDescription(pitch.description),
      formatGameDate(pitch.game_date),
    ]
  } as TableRow)), [pitches]);

  const { sortConfig, handleSort, sortData } = useSort();
  const sortedRows = useMemo(() => sortData(rows), [rows, sortData]);

  return (
    <TableComponent
      tableName="pitches"
      columns={PITCH_COLUMNS}
      data={sortedRows}
      isLoading={isLoading}
      error={error}
      totalCount={total_count}
      hasMoreData={!!next_cursor}
      onLoadMore={() => fetchPitches(next_cursor)}
      onRowClick={(rowId) => navigate(`/pitch-details/${rowId}`)}
      sortColumn={sortConfig.columnIndex}
      sortDirection={sortConfig.direction}
      onSort={handleSort}
    />
  );
}