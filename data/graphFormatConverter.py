#!/usr/bin/env python3
import argparse
import json

import networkx as nx
import networkx.readwrite as io
import sys

FILETYPE_GDF = "gdf"
FILETYPE_GML = "gml"
FILETYPE_MTX = "mtx"
FILETYPE_EDGE = "edge"
FILETYPE_EDGES = "edges"
FILETYPE_JSON = "json"

SUPPORTED_TYPE = [FILETYPE_GDF, FILETYPE_GML, FILETYPE_MTX, FILETYPE_EDGE, FILETYPE_EDGES, FILETYPE_JSON]


def parseJSON(filename):
  """
  Parses an JSON file and returns an array with edges
  :param filename: the path to the file
  :return: a networkx Graph object
  """
  with open(filename) as f:
    js_graph = json.load(f)
  return io.json_graph.node_link_graph(js_graph)


def parseMTX(filename):
  """
  Parses an MTX file and returns an array with edges
  :param filename: the path to the file
  :return: a networkx Graph object
  """
  g = nx.Graph()
  with open(filename, 'r') as fp:
    for line in fp.readlines():
      line = line.rstrip()
      if not line.startswith('%'):
        parts = line.split(' ')
        src = int(parts[0])
        tgt = int(parts[1])
        if src != tgt:
          wgt = 1
          if len(parts) > 2:
            if parts[2] is not ' ' and parts[2] is not '':
              wgt = float(parts[2])

          g.add_edge(src, tgt, value=wgt)
  return g


def parseGDF(filename):
  """
  Parses a GDF file and returns an array with edges
  :param filename: the path to the file
  :return: a networkx Graph object
  """
  COLUMN_SRC = 0
  COLUMN_TGT = 1
  COLUMN_WEIGHT = 1

  g = nx.Graph()
  edges = False
  with open(filename, 'r') as fp:
    for line in fp.readlines():
      line = line.rstrip()

      if line.startswith('edgedef'):
        edges = True
        continue
      if not edges:
        continue

      if not line.startswith('nodedef'):
        parts = line.split(',')
        src = int(parts[COLUMN_SRC])
        tgt = int(parts[COLUMN_TGT])
        wgt = float(parts[COLUMN_WEIGHT])
        g.add_edge(src, tgt, value=wgt)
  return edges


def parseEdge(filename):
  """
  Parses an Edge file and returns a networkx Graph
  :param filename: the path to the file
  :return: a networkx Graph object
  """
  return io.read_edgelist(filename)
  # g = nx.Graph()
  # with open(filename, 'r') as fp:
  #   for line in fp.readlines():
  #     line = line.rstrip()
  #     if not line.startswith('%'):
  #       parts = line.split('  ')
  #       src = int(parts[0])
  #       tgt = int(parts[1])
  #       wgt = 1
  #       if len(parts) > 2:
  #         if parts[2] is not ' ' and parts[2] is not '':
  #           wgt = float(parts[2])
  #
  #       g.add_edge(src, tgt, value=wgt)
  #
  # return g


def findFileType(filename):
  """
  Guesses the file type by extension
  :param filename: the file which type is unclear
  :return: the type of the file
  """
  parts = filename.split('.')
  ext = parts[-1]

  if ext not in SUPPORTED_TYPE:
    print("ERROR: unsupported file type", ext, "for", filename)
    sys.exit()

  if ext == FILETYPE_EDGES:
    ext = FILETYPE_EDGE

  return ext


def convertCoordinates(inputFile, outPutFile, inType=None, outType=None):
  '''
  Converts the graph file format and writes the output file
  :param inputFile: the path to the input file
  :param outPutFile: the path to the output file
  :param inType: the input type, if None it will be guessed by the file extension
  :param outType: the output type, if None it will be guessed by the file extension
  '''

  inType = findFileType(inputFile) if inType is None else inType
  outType = findFileType(outPutFile) if outType is None else outType

  print("converting", inputFile, "(type " + inType + ") to", outPutFile, "(type " + outType + ")...")
  g = nx.Graph()

  if inType == FILETYPE_GDF:
    g = parseGDF(inputFile)
  elif inType == FILETYPE_MTX:
    g = parseMTX(inputFile)
  elif inType == FILETYPE_EDGE:
    g = parseEdge(inputFile)
  elif inType == FILETYPE_GML:
    g = io.read_gml(inputFile)
  elif inType == FILETYPE_JSON:
    g = parseJSON(inputFile)

  if outType == FILETYPE_GML:
    io.write_gml(g, outPutFile)


def main():
  parser = argparse.ArgumentParser(description='Script to convert graph files')

  parser.add_argument('inputFile', type=str, help="The input file")
  parser.add_argument('outFile', type=str, help="The name of the output file")
  parser.add_argument('--inputType', type=str, default=None,
                      help="The file type of the input file. If not given it is 'guess' by the file extension")
  parser.add_argument('--outputType', type=str, default=None,
                      help="The file type of the output file. If not given it is 'guess' by the file extension")

  args = parser.parse_args()

  convertCoordinates(args.inputFile, args.outFile, args.inputType, args.outputType)
  print("conversion ran succesfully")


if __name__ == "__main__":
  main()
